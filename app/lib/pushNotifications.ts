import { PushNotifications } from '@capacitor/push-notifications'
import { supabase } from './supabase'
import { Capacitor } from '@capacitor/core'
export async function registerPushNotifications() {
  if (!Capacitor.isNativePlatform()) {
    console.log('Not running on Android/iOS')
    return
  }

  alert('registerPushNotifications started')

  console.log('🚀 registerPushNotifications started')

  alert('Checking permissions...')

  let permStatus = await PushNotifications.checkPermissions()

  alert(JSON.stringify(permStatus))

  console.log('Permission status:', permStatus)
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

alert('PushNotifications.register() finished')

PushNotifications.addListener('registration', async (token) => {
  alert('FCM TOKEN RECEIVED')

const result = await supabase.auth.getUser()

alert(
  'Current user:\n' +
  JSON.stringify(result.data.user, null, 2)
)

const user = result.data.user

  if (!user) {
    alert('NO USER LOGGED IN')
    return
  }

  alert('USER ID:\n' + user.id)
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
    alert('SUPABASE ERROR:\n' + JSON.stringify(error))
  } else {
    alert('TOKEN SAVED!')
  }
})

PushNotifications.addListener('registrationError', (err) => {
  alert('REGISTRATION ERROR:\n\n' + JSON.stringify(err))

  console.error('❌ Registration error:', err)
})
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('📩 Notification received:', notification)
  })

PushNotifications.addListener(
  'pushNotificationActionPerformed',
  (notification) => {
    console.log('👆 Notification tapped:', notification)

    const rideId =
      notification.notification.data?.ride_id

    if (rideId) {
      window.location.href =
        `/driver?ride=${rideId}`
    } else {
      window.location.href = '/driver'
    }
  }
)
}