import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { supabase } from './supabase'

export async function registerPushNotifications() {
  if (!Capacitor.isNativePlatform()) {
    console.log('Not running on Android/iOS')
    return
  }

  console.log('🚀 registerPushNotifications started')

  let permStatus = await PushNotifications.checkPermissions()

  console.log('Permission status:', permStatus)

  if (permStatus.receive === 'prompt') {
    console.log('Requesting permission...')
    permStatus = await PushNotifications.requestPermissions()
    console.log('New permission:', permStatus)
  }

  if (permStatus.receive !== 'granted') {
    console.log('❌ Notification permission denied')
    return
  }

  console.log('Registering with Firebase...')
  await PushNotifications.register()

  console.log('PushNotifications.register() finished')

  PushNotifications.addListener('registration', async (token) => {
    console.log('✅ FCM Token:', token.value)

    const result = await supabase.auth.getUser()
    const user = result.data.user

    if (!user) {
      console.log('❌ No user logged in')
      return
    }

    console.log('User ID:', user.id)

    const { error } = await supabase
      .from('device_tokens')
      .upsert(
        {
          user_id: user.id,
          token: token.value,
          platform: 'android',
        },
        {
          onConflict: 'token',
        }
      )

    if (error) {
      console.error('❌ Supabase error:', error)
    } else {
      console.log('✅ Token saved successfully')
    }
  })

  PushNotifications.addListener('registrationError', (err) => {
    console.error('❌ Registration error:', err)
  })

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('📩 Notification received:', notification)
  })

  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification) => {
      console.log('👆 Notification tapped:', notification)

      const rideId = notification.notification.data?.ride_id

      if (rideId) {
        window.location.href = `/driver?ride=${rideId}`
      } else {
        window.location.href = '/driver'
      }
    }
  )
}