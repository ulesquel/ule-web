import { useState } from 'react'

export const usePassword = (): [boolean, (e?: React.MouseEvent) => void] => {
  const [isPasswordHidden, setIsPasswordHidden] = useState<boolean>(true)

  const handleHiddenPasswordClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
    }
    setIsPasswordHidden((prev) => !prev)
  }

  return [isPasswordHidden, handleHiddenPasswordClick]
}
