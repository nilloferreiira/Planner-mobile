import {
  Text,
  TextProps,
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps
} from "react-native"
import clsx from "clsx"
import { createContext, useContext } from "react"

type Variants = "primary" | "secondary"

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variants
  isLoading?: boolean
}

const ThemeContext = createContext<{ variant?: Variants }>({})

function Button({
  variant = "primary",
  isLoading,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={clsx(
        "min-h-11 max-h-11 flex-row items-center justify-center gap-2 rounded-lg px-2",
        {
          "bg-lime-300": variant === "primary",
          "bg-zinc-800": variant === "secondary"
        },
        className
      )}
      activeOpacity={0.7}
      disabled={isLoading}
      {...rest}
    >
      <ThemeContext.Provider value={{ variant }}>
        {isLoading ? <ActivityIndicator className="text-lime-950" /> : children}
      </ThemeContext.Provider>
    </TouchableOpacity>
  )
}

function Title({ children }: TextProps) {
  const { variant } = useContext(ThemeContext)
  return (
    <Text
      className={clsx("text-base font-semibold", {
        "text-lime-950": variant === "primary",
        "text-zinc-200": variant === "secondary"
      })}
    >
      {children}
    </Text>
  )
}

Button.Title = Title

export { Button }
