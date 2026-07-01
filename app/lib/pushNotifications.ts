import { PushNotifications } from '@capacitor/push-notifications'

export async function registerPushNotifications() {
  let permStatus = await PushNotifications.checkPermissions()

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions()
  }

  if (permStatus.receive !== 'granted') {
    console.log('Notification permission denied')
    return
  }

  await PushNotifications.register()

  PushNotifications.addListener('registration', (token) => {
    console.log('FCM TOKEN:', token.value)
  })

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Registration error:', err)
  })

  PushNotifications.addListener(
    'pushNotificationReceived',
    (notification) => {
      console.log('Notification received:', notification)
    }
  )

  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification) => {
      console.log('Notification tapped:', notification)
    }
  )
}