import { checkCurrencyFormat, strToCents } from './currencyFormat';

test('Vérification de la transformation du format', () => {
  expect(checkCurrencyFormat('abc1234.7')).toBe('1234.7');
  expect(checkCurrencyFormat('abc1234')).toBe('1234');
  expect(checkCurrencyFormat('abc1234.78')).toBe('1234.78');
  expect(checkCurrencyFormat('abc1234.78789')).toBe('1234.78');
  expect(checkCurrencyFormat('abc12sgh34.78.789')).toBe('1234.78');
  expect(checkCurrencyFormat('abc12sgh34.7.8.789')).toBe('1234.7');
  expect(checkCurrencyFormat('ab @@ c12sgh34.7.8.789')).toBe('1234.7');
});

test('Vérification de la conversion strToCents', () => {
  expect(strToCents('123.45')).toBe(12345);
  expect(strToCents('1 234.56')).toBe(123456);
  expect(strToCents('1 234.567')).toBe(123456);
});
