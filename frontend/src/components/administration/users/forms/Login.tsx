import MessageSpan from '@/components/administration/users/forms/MessageSpan'
import { passwordValidators, usernameValidators } from '@/constants'
import { usePassword } from '@/hooks/usePassword'
import type { LoginData } from '@/types/types'
import { useState } from 'react'
import { useForm, type RegisterOptions } from 'react-hook-form'
import ShowPasswordButton from './ShowPasswordButton'

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    watch,
    subscribe,
    formState: { errors },
  } = useForm<LoginData>({ mode: 'onTouched' })
  const [isPasswordHidden, handleHiddenPasswordClick] = usePassword()
  const [loginError, setLoginError] = useState<string>('')

  const login = async (loginData: LoginData) => {
    try {
      const res = await fetch('http://localhost:3000/users/login', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000/',
        },
        body: JSON.stringify(loginData),
        credentials: 'include',
      })

      if (!res.ok) {
        const error = await res.json()
        setLoginError(error.message)
        return
      }

      const loginMessage = await res.json()
      globalThis.window.navigation.reload()
      setLoginError('')
      alert(loginMessage.message)
    } catch (err) {
      setLoginError(
        'Ocurrió un error inesperado, intentelo de nuevo más tarde.',
      )
    }
  }

  return (
    <form className="w-5/12" onSubmit={handleSubmit(login)}>
      {loginError && <MessageSpan type="error" message={loginError} />}
      <label>
        Nombre de usuario
        {errors.username && (
          <MessageSpan
            type="error"
            message={errors.username?.message as string}
          />
        )}
        <input
          type="text"
          {...register(
            'username',
            usernameValidators as RegisterOptions<LoginData, 'username'>,
          )}
        />
      </label>
      <label>
        Contraseña
        {errors.password && (
          <MessageSpan
            type="error"
            message={errors.password?.message as string}
          />
        )}
        <input
          type={isPasswordHidden ? 'password' : 'text'}
          {...register(
            'password',
            passwordValidators as RegisterOptions<LoginData, 'password'>,
          )}
        />
        <ShowPasswordButton
          isPasswordHidden
          handleHiddenPasswordClick={handleHiddenPasswordClick}
        />
      </label>
      <input type="submit" value="Iniciar sesión" />
    </form>
  )
}
