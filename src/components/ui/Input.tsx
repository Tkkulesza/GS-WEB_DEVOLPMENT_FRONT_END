import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { CLASSES_INPUT } from './estilos'

export function Input({ className = '', ...resto }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CLASSES_INPUT} ${className}`} {...resto} />
}

export function TextArea({
  className = '',
  ...resto
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${CLASSES_INPUT} min-h-28 resize-y ${className}`} {...resto} />
}
