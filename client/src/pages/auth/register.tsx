import { useState } from "react"
import { Link } from "react-router-dom"

import AuthLayout from "../../layouts/auth-layout"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useDirection } from "../../context/direction/direction-provider"
import { useRegister } from "../../hooks/auth/use-register"

export default function Register() {
  const { t } = useDirection()
  const { isSubmitting, errors, handleRegister } = useRegister(t)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await handleRegister({ username, email, password })
  }

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{t("auth.registerTitle")}</CardTitle>
            <CardDescription>{t("auth.registerDescription")}</CardDescription>
            <CardAction>
              <Link to="/login">
                <Button variant="link" className="text-foreground">
                  {t("auth.logIn")}
                </Button>
              </Link>
            </CardAction>
          </CardHeader>

          <CardContent>
            <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="username">{t("auth.username")}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={errors.username ? "border-destructive" : ""}
                />
                {errors.username && (
                  <span className="text-xs text-destructive">
                    {errors.username}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <span className="text-xs text-destructive">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.password")}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <span className="text-xs text-destructive">
                    {errors.password}
                  </span>
                )}
              </div>

              {errors.general && (
                <div className="text-sm font-medium text-destructive">
                  {errors.general}
                </div>
              )}

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("auth.creating") : t("auth.createAccount")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
