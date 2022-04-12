import { filterCurrencyInput, strToCents } from './currencyFormat';

test('Vérification de la transformation du format', () => {
  expect(filterCurrencyInput('abc1234.7')).toBe('1234.7');
  expect(filterCurrencyInput('abc1234')).toBe('1234');
  expect(filterCurrencyInput('abc1234.78')).toBe('1234.78');
  expect(filterCurrencyInput('abc1234.78789')).toBe('1234.78');
  expect(filterCurrencyInput('abc12sgh34.78.789')).toBe('1234.78');
  expect(filterCurrencyInput('abc12sgh34.7.8.789')).toBe('1234.7');
  expect(filterCurrencyInput('ab @@ c12sgh34.7.8.789')).toBe('1234.7');
});

test('Vérification de la conversion strToCents', () => {
  for (let i = 0; i < 100000; i += 1) {
    const integer = Math.floor(Math.random() * 1000);
    const decimal = Math.floor(Math.random() * 100);
    const strVal = `${integer.toString()}.${decimal < 10 ? '0' : ''}${decimal.toString()}`;
    expect(strToCents(strVal)).toBe(integer * 100 + decimal);
  }
});
