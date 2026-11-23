import { expiryError, isValidCardNumber, isValidCvv, isValidHolder } from './card.validators';

describe('Validação dos dados do cartão', () => {
  it.each(['4242 4242 4242 4242', '4000-0000-0000-0002', '5555555555554444'])(
    'deve aceitar o número válido %s',
    (number) => expect(isValidCardNumber(number)).toBe(true),
  );
  it.each([
    '',
    '4242424242424241',
    '0000000000000000',
    '424242424242',
    '42424242424242424242',
    '4242a424242424242',
    '378282246310005',
    '4222222222222',
    '4000000000000000006',
  ])('deve rejeitar o número inválido %s', (number) =>
    expect(isValidCardNumber(number)).toBe(false),
  );
  it('deve aceitar nomes com acentos e rejeitar espaços, números e símbolos isolados', () => {
    expect(isValidHolder(" Ana D'Ávila ")).toBe(true);
    expect(isValidHolder('João')).toBe(true);
    for (const name of ['', '  ', '12', '--']) expect(isValidHolder(name)).toBe(false);
  });
  it('deve limitar o nome a 80 caracteres sem restringir nomes com mais de 20 caracteres', () => {
    expect(isValidHolder('Leonardo Carvalho da Silva')).toBe(true);
    expect(isValidHolder('A'.repeat(80))).toBe(true);
    expect(isValidHolder('A'.repeat(81))).toBe(false);
  });
  it('deve aceitar o mês atual e rejeitar mês anterior, ano anterior e formato inválido', () => {
    const now = new Date(2030, 10, 19);
    expect(expiryError('11/30', now)).toBeNull();
    expect(expiryError('01/31', now)).toBeNull();
    expect(expiryError('10/30', now)).toBe('expired');
    expect(expiryError('12/29', now)).toBe('expired');
    for (const value of ['00/31', '13/31', '1/31', '11/2030', 'abcd'])
      expect(expiryError(value, now)).toBe('expiry');
  });
  it('deve aceitar somente CVV com três dígitos', () => {
    for (const cvv of ['123', '000']) expect(isValidCvv(cvv)).toBe(true);
    for (const cvv of ['', '12', '1234', '12345', '1a3']) expect(isValidCvv(cvv)).toBe(false);
  });
});
