'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import {
  PushNotifications,
  Token,
} from '@capacitor/push-notifications'

export default function PushNotificationSetup() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const register = async () => {
      const permission = await PushNotifications.requestPermissions()

      if (permission.receive !== 'granted') {
        
        return
      }

      await PushNotifications.register()

      PushNotifications.addListener(
        'registration',
        (token: Token) => {
          
        }
      )

      PushNotifications.addListener(
        'registrationError',
        err => {
          console.error(err)
        }
      )
    }

    register()
  }, [])

  return null
}