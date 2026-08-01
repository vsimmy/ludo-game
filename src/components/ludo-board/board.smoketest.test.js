/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/no-unnecessary-act */
// This is a fuzz-style integration smoke test, not a typical single-assertion UI test —
// it needs direct container queries to find dynamically-generated piece elements
// (ids like "blue-1") that don't have stable roles/text, and needs `act()` around
// fireEvent+advanceTimersByTime pairs so batched timer-driven state updates flush
// before the next assertion. Both are deliberate here, not oversights.
import { render, screen, fireEvent, act } from '@testing-library/react';
import Board from './board';

// Silence expected noisy logs (websocket connection errors are expected — no server running in tests)
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => { });
  jest.spyOn(console, 'log').mockImplementation(() => { });
  jest.useFakeTimers();
});
afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
  jest.useRealTimers();
});

test('renders the player setup screen without crashing', () => {
  render(<Board />);
  expect(screen.getByText(/Player Setup/i)).toBeTruthy();
});

test('plays 300 automated rolls without throwing, and clicks any selectable pieces', () => {
  const { container } = render(<Board />);

  // Complete player setup: default is 1 player, fill in name + color, then start.
  const nameInput = container.querySelector('input[type="text"]');
  fireEvent.change(nameInput, { target: { value: 'Tester' } });
  const colorSelect = container.querySelectorAll('select')[1];
  fireEvent.change(colorSelect, { target: { value: 'Red' } });

  const startButton = Array.from(container.querySelectorAll('button')).find(b => /Start Game/i.test(b.textContent));
  expect(startButton).toBeTruthy();
  expect(startButton.disabled).toBe(false);

  act(() => {
    fireEvent.click(startButton);
    jest.advanceTimersByTime(400); // handleStartGame has a 300ms setTimeout
  });

  let crashed = false;
  let rollsPerformed = 0;

  for (let i = 0; i < 300; i++) {
    const rollBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent.includes('Roll the Dice'));
    if (!rollBtn || rollBtn.disabled) {
      // Either the game ended (winner) or roll is mid-animation — advance timers and retry
      act(() => { jest.advanceTimersByTime(600); });
      continue;
    }
    try {
      act(() => {
        fireEvent.click(rollBtn);
        jest.advanceTimersByTime(600); // dice tumble + settle
      });
      rollsPerformed++;

      // Try clicking any rendered piece elements (ids like "color-N") to exercise move logic
      const pieceEls = Array.from(container.querySelectorAll('[id]')).filter(el => /^(blue|green|red|orange)-\d+$/.test(el.id));
      if (pieceEls.length > 0) {
        act(() => {
          fireEvent.click(pieceEls[0]);
          jest.advanceTimersByTime(3000); // let any spot-by-spot animation settle
        });
      }
    } catch (e) {
      crashed = true;
      console.log('CRASH on iteration', i, e); // eslint-disable-line no-console
      break;
    }

    // Stop early if the game reports a winner
    if (container.textContent.includes('WINS')) {
      break;
    }
  }

  expect(crashed).toBe(false);
  expect(rollsPerformed).toBeGreaterThan(0);
  process.stdout.write(`\nRolls performed: ${rollsPerformed} | Reached a win: ${container.textContent.includes('WINS')}\n`);
});
