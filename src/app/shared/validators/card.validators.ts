import { ValidatorFn } from '@angular/forms';
import { ICardData } from '@shared/interfaces/ICardData';

export function normalizeCardNumber(value: string): string {
  return value.replace(/[\s-]/g, '');
}

export function isValidCardNumber(value: string): boolean {
  const digits = normalizeCardNumber(value);
  if (!/^\d{13,19}$/.test(digits) || /^(\d)\1+$/.test(digits)) return false;

  const sum = [...digits].reverse().reduce((total, digit, index) => {
    let number = Number(digit);
    if (index % 2 === 1) number *= 2;
    return total + (number > 9 ? number - 9 : number);
  }, 0);
  return sum % 10 === 0;
}

export function isValidHolder(value: string): boolean {
  return (
    value.trim().length >= 2 && /\p{L}/u.test(value) && /^[\p{L}\p{M} .'-]+$/u.test(value.trim())
  );
}

export function expiryError(value: string, now = new Date()): 'expiry' | 'expired' | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return 'expiry';
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  return year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)
    ? 'expired'
    : null;
}

export function isValidCvv(value: string): boolean {
  return /^\d{3,4}$/.test(value);
}

export function isValidCard(card: ICardData): boolean {
  return (
    isValidCardNumber(card.number) &&
    isValidHolder(card.holder) &&
    expiryError(card.expiry) === null &&
    isValidCvv(card.cvv)
  );
}

export const cardNumberValidator: ValidatorFn = (control) =>
  !control.value || isValidCardNumber(control.value) ? null : { cardNumber: true };

export const cardHolderValidator: ValidatorFn = (control) =>
  !control.value || isValidHolder(control.value) ? null : { cardHolder: true };

export const cardExpiryValidator: ValidatorFn = (control) => {
  if (!control.value) return null;
  const error = expiryError(control.value);
  return error ? { [error]: true } : null;
};

export const cardCvvValidator: ValidatorFn = (control) =>
  !control.value || isValidCvv(control.value) ? null : { cvv: true };
