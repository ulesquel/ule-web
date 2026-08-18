import type { LoginData } from '@/types/types'
import { useState } from 'react'
import { useForm, type RegisterOptions } from 'react-hook-form'
import ErrorMessageSpan from './ErrorMessageSpan'

const closedEye =
  'M19.707 5.707a1 1 0 0 0-1.414-1.414l-4.261 4.26a4 4 0 0 0-5.478 5.478l-4.261 4.262a1 1 0 1 0 1.414 1.414l4.261-4.26a4 4 0 0 0 5.478-5.478zm-7.189 4.36a2 2 0 0 0-2.45 2.45zm-1.036 3.865 2.45-2.45Q14 11.73 14 12a2 2 0 0 1-2.518 1.932m4.283-9.111C14.63 4.32 13.367 4 12 4 9.148 4 6.757 5.395 4.998 6.906c-1.765 1.517-2.99 3.232-3.534 4.064a1.88 1.88 0 0 0 0 2.06 20.3 20.3 0 0 0 2.748 3.344l1.414-1.414A18.3 18.3 0 0 1 3.18 12c.51-.773 1.598-2.268 3.121-3.577C7.874 7.072 9.816 6 12 6a7 7 0 0 1 2.22.367zM12 18a7 7 0 0 1-2.22-.367L8.236 19.18c1.136.5 2.398.821 3.765.821 2.852 0 5.243-1.395 7.002-2.906 1.765-1.517 2.99-3.232 3.534-4.064a1.88 1.88 0 0 0 0-2.06 20.3 20.3 0 0 0-2.748-3.344L18.374 9.04A18.3 18.3 0 0 1 20.82 12c-.51.773-1.598 2.268-3.121 3.577C16.126 16.928 14.184 18 12 18'
const openedEye =
  'M6.301 15.577C4.778 14.268 3.691 12.773 3.18 12c.51-.773 1.598-2.268 3.121-3.577C7.874 7.072 9.816 6 12 6s4.126 1.072 5.699 2.423c1.523 1.309 2.61 2.804 3.121 3.577-.51.773-1.598 2.268-3.121 3.577C16.126 16.928 14.184 18 12 18s-4.126-1.072-5.699-2.423M12 4C9.148 4 6.757 5.395 4.998 6.906c-1.765 1.517-2.99 3.232-3.534 4.064a1.88 1.88 0 0 0 0 2.06c.544.832 1.769 2.547 3.534 4.064C6.758 18.605 9.148 20 12 20s5.243-1.395 7.002-2.906c1.765-1.517 2.99-3.232 3.534-4.064a1.88 1.88 0 0 0 0-2.06c-.544-.832-1.769-2.547-3.534-4.064C17.242 5.395 14.852 4 12 4m-2 8a2 2 0 1 1 4 0 2 2 0 0 1-4 0m2-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8'

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    watch,
    subscribe,
    formState: { errors },
  } = useForm<LoginData>({ mode: 'onTouched' })
  const [isPasswordHidden, setIsPasswordHidden] = useState<boolean>(true)
  const [loginError, setLoginError] = useState<string>('')

  const handleHiddenPasswordClick = () => {
    setIsPasswordHidden((prev) => !prev)
  }

  const usernameValidators: RegisterOptions<LoginData, 'username'> = {
    required: 'El nombre de usuario es requerido.',
    minLength: {
      value: 4,
      message: 'El nombre de usuario tiene que tener al menos 4 caracteres.',
    },
  }

  const passwordValidators: RegisterOptions<LoginData, 'password'> = {
    required: 'La contraseña es requerida.',
    minLength: {
      value: 8,
      message: 'La contraseña debe tener al menos 8 caracteres.',
    },
  }

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
      window.navigation.reload()
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
      {loginError && <ErrorMessageSpan errorMessage={loginError} />}
      <label>
        Nombre de usuario
        {errors.username && (
          <ErrorMessageSpan errorMessage={errors.username?.message as string} />
        )}
        <input type="text" {...register('username', usernameValidators)} />
      </label>
      <label>
        Contraseña
        {errors.password && (
          <ErrorMessageSpan errorMessage={errors.password?.message as string} />
        )}
        <input
          type={isPasswordHidden ? 'password' : 'text'}
          {...register('password', passwordValidators)}
        />
        <button
          title={isPasswordHidden ? 'Ver contraseña' : 'Ocultar contraseña'}
          type="button"
          className="absolute right-0 bottom-0 mx-[3%] my-[2.5%] border-none bg-transparent hover:cursor-pointer hover:outline-none focus:outline-none"
          onClick={handleHiddenPasswordClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              id="SVGRepo_iconCarrier"
              fill="#000"
              fillRule="evenodd"
              clipRule="evenodd"
              d={isPasswordHidden ? openedEye : closedEye}
            ></path>
          </svg>
        </button>
      </label>
      <input type="submit" value="Iniciar sesión" />
    </form>
  )
}
