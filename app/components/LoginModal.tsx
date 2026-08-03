'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowser } from '../lib/supabase-browser'
import { registerPushNotifications } from '../lib/pushNotifications'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

interface LoginModalProps {
  onClose: () => void
  onLogin: () => void
}

export default function LoginModal({ onClose, onLogin }: LoginModalProps) {

  const supabaseBrowser = getSupabaseBrowser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')


  useEffect(() => {

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'auto'
    }

  }, [])



  const handleToggleMode = (signUpState: boolean) => {

    setErrorMsg('')
    setSuccessMsg('')
    setIsSignup(signUpState)

  }



  const resetPassword = async () => {

    setErrorMsg('')
    setSuccessMsg('')


    if (!email.trim()) {

      return setErrorMsg(
        'Please enter your email address above first.'
      )

    }


    const { error } =
      await supabaseBrowser.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
          "https://streetgo.app/reset-password",
        }
      )


    if(error){

      return setErrorMsg(error.message)

    }


    setSuccessMsg(
      'A password reset link has been dispatched to your email.'
    )

  }




  const handleAuth = async () => {

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')



    if(isSignup){

      const cleanUsername = username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g,'')



      if(cleanUsername.length < 3){

        setLoading(false)

        return setErrorMsg(
          'Username must be at least 3 characters long.'
        )

      }



      if(!email.trim()){

        setLoading(false)

        return setErrorMsg(
          'Email field cannot be empty.'
        )

      }



      if(password.length < 8){

        setLoading(false)

        return setErrorMsg(
          'Password must be at least 8 characters long.'
        )

      }



      const reserved = [
        'admin',
        'support',
        'owner',
        'official',
        'moderator',
        'system',
        'tunda',
        'tundastreet'
      ]



      if(reserved.includes(cleanUsername)){

        setLoading(false)

        return setErrorMsg(
          'This username is reserved and unavailable.'
        )

      }



      const { data: existingUser } =
        await supabaseBrowser
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle()



      if(existingUser){

        setLoading(false)

        return setErrorMsg(
          'This username is already claimed.'
        )

      }



      const {
        data,
        error
      } = await supabaseBrowser.auth.signUp({

        email,
        password

      })



      if(error){

        setLoading(false)

        return setErrorMsg(error.message)

      }



      if(data.user){


        const {
          error: profileError
        } = await supabaseBrowser
          .from('profiles')
          .insert({

            id:data.user.id,
            username:cleanUsername,
            avatar_url:null,
            created_at:new Date().toISOString()

          })



        if(profileError){

          console.error(
            "PROFILE INSERT ERROR:",
            profileError
          )

          setLoading(false)

          return setErrorMsg(
            profileError.message
          )

        }



        const {
          error: walletError
        } =
        await supabaseBrowser
        .from("wallets")
        .insert({

          user_id:data.user.id,
          balance:0,
          reax_balance:0

        })



        if(walletError){

          console.error(
            "WALLET INSERT ERROR:",
            walletError
          )

          setLoading(false)

          return setErrorMsg(
            walletError.message
          )

        }

      }



    } else {


      const {
        data,
        error
      } =
      await supabaseBrowser.auth.signInWithPassword({

        email,
        password

      })



      if(error){

        setLoading(false)

        return setErrorMsg(error.message)

      }



      if(data.session){

        await supabaseBrowser.auth.setSession({

          access_token:
          data.session.access_token,

          refresh_token:
          data.session.refresh_token

        })

      }



      await new Promise(resolve =>
        setTimeout(resolve,500)
      )


      await registerPushNotifications()

    }



    setLoading(false)

    onLogin()

    onClose()

  }



  return (

    <div className="
      fixed inset-0
      bg-black/60
      backdrop-blur-md
      flex items-center justify-center
      z-50
      p-4
    ">

      <div className="
        w-full
        max-w-md
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        p-1
      ">


        {isSignup ? (

          <SignupForm

            username={username}
            email={email}
            password={password}

            loading={loading}

            onUsernameChange={setUsername}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}

            onSignup={handleAuth}

            onSwitchToLogin={() =>
              handleToggleMode(false)
            }

          />

        ) : (

          <LoginForm

            email={email}
            password={password}

            loading={loading}

            onEmailChange={setEmail}
            onPasswordChange={setPassword}

            onLogin={handleAuth}

            onForgotPassword={resetPassword}

            onSwitchToSignup={() =>
              handleToggleMode(true)
            }

          />

        )}



        <div className="px-8 pb-3">


          {errorMsg && (

            <div className="
              text-xs
              text-red-400
              bg-red-500/10
              p-3
              rounded-xl
            ">

              {errorMsg}

            </div>

          )}



          {successMsg && (

            <div className="
              text-xs
              text-emerald-400
              bg-emerald-500/10
              p-3
              rounded-xl
            ">

              {successMsg}

            </div>

          )}



          <button

            type="button"

            onClick={onClose}

            className="
              w-full
              text-xs
              text-zinc-500
              py-2
            "

          >

            Cancel and go back

          </button>


        </div>


      </div>


    </div>

  )

}