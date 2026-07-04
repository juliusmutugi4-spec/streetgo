import { PushNotifications } from '@capacitor/push-notifications'
import { supabase } from './supabase'

export async function registerPushNotifications() {
  console.log('🚀 registerPushNotifications started')

  console.log('Checking permissions...')
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

  PushNotifications.addListener('registration', async (token) => {
    console.log('✅ FCM TOKEN:', token.value)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('No logged in user')
      return
    }

    const { error } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: user.id,
        token: token.value,
        platform: 'android',
      })

    if (error) {
      console.error(error)
    } else {
      console.log('✅ Device token saved successfully')
    }
  })

  PushNotifications.addListener('registrationError', (err) => {
    console.error('❌ Registration error:', err)
  })

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('📩 Notification received:', notification)
  })

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('👆 Notification tapped:', notification)
  })
}