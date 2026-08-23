import MessageSpan from '@/components/administration/users/forms/MessageSpan'
import ShowPasswordButton from '@/components/administration/users/forms/ShowPasswordButton'
import {
  confirmPasswordValidator,
  DIFFERENT_PASSWORD_ERROR,
  passwordValidators,
  roleValidators,
  usernameValidators,
} from '@/constants'
import { usePassword } from '@/hooks/usePassword'
import type { RegisterUserData } from '@/types/types'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

interface RegisterProps {
  accessToken: string
  refreshToken: string
  apiUrl: string
}

export default function Register({
  refreshToken,
  accessToken,
  apiUrl,
}: RegisterProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RegisterUserData>({ mode: 'onTouched' })
  const [formState, setFormState] = useState<{
    state: 'error' | 'success' | ''
    message: string
  }>({ state: '', message: '' })
  const [isPasswordHidden, handleHiddenPasswordClick] = usePassword()
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  useEffect(() => {
    if (confirmPassword !== password) {
      setFormState({ state: 'error', message: DIFFERENT_PASSWORD_ERROR })
    } else {
      setFormState({ state: '', message: '' })
    }
  }, [confirmPassword])

  const registerNewUser = async (registerData: RegisterUserData) => {
    console.log(registerData)
    const { password, confirmPassword } = registerData

    if (password !== confirmPassword) {
      setFormState({ state: 'error', message: DIFFERENT_PASSWORD_ERROR })
      return
    }

    try {
      const res = await fetch(`${apiUrl}users/register`, {
        method: 'post',
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000/',
        },
        body: JSON.stringify(registerData),
        credentials: 'include',
      })

      if (res.status === 418) {
        globalThis.window.navigation.reload()
      }

      const { ok } = res
      const { message } = await res.json()

      if (!ok) {
        setFormState({ state: 'error', message })
        return
      }

      console.log(message)
    } catch (error: any) {
      setFormState({
        state: 'error',
        message:
          'Hubo un problema al intentar registrar un usuario. Estamos trabajando para resolverlo. Vuelva a intentarlo más tarde.',
      })
    }

    console.log('Bien')
  }

  const handleReset = (e: React.MouseEvent) => {
    handleHiddenPasswordClick()
    reset()
  }

  return (
    <form className="mx-auto w-[60%]" onSubmit={handleSubmit(registerNewUser)}>
      {formState && (
        <MessageSpan
          type={formState.state as 'success' | 'error'}
          message={formState.message}
        />
      )}

      <label>
        Nombre de usuario
        {errors.username && (
          <MessageSpan
            type="error"
            message={errors.username?.message as string}
          />
        )}
        <input type="text" {...register('username', usernameValidators)} />
      </label>
      <label>
        Rol
        {errors.role && (
          <MessageSpan type="error" message={errors.role?.message as string} />
        )}
        <select defaultValue={''} {...register('role', roleValidators)}>
          <option value="" disabled>
            Seleccione el rol
          </option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select>
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
          {...register('password', passwordValidators)}
        />
        <ShowPasswordButton
          isPasswordHidden
          handleHiddenPasswordClick={handleHiddenPasswordClick}
        />
      </label>
      <label>
        Confirmar contraseña
        {errors.confirmPassword && (
          <MessageSpan
            type="error"
            message={errors.confirmPassword?.message as string}
          />
        )}
        <input
          type={isPasswordHidden ? 'password' : 'text'}
          {...register('confirmPassword', confirmPasswordValidator)}
        />
      </label>
      <section className="flex w-full flex-col justify-center gap-4 sm:flex-row">
        <input type="reset" onClick={handleReset} value="Cancelar" />
        <input type="submit" value="Registrar nuevo usuario" />
      </section>
    </form>
  )
}
