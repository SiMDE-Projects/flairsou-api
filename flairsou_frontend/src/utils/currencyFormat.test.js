import { checkCurrencyFormat } from './currencyFormat';

test('Vérification de la transformation du format', () => {
  expect(checkCurrencyFormat('abc1234.7')).toBe('1234.7');
  expect(checkCurrencyFormat('abc1234')).toBe('1234');
  expect(checkCurrencyFormat('abc1234.78')).toBe('1234.78');
  expect(checkCurrencyFormat('abc1234.78789')).toBe('1234.78');
  expect(checkCurrencyFormat('abc12sgh34.78.789')).toBe('1234.78');
  expect(checkCurrencyFormat('abc12sgh34.7.8.789')).toBe('1234.7');
  expect(checkCurrencyFormat('ab @@ c12sgh34.7.8.789')).toBe('1234.7');
});
