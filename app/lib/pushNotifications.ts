import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { supabase } from './supabase'

export async function registerPushNotifications() {
  if (!Capacitor.isNativePlatform()) {
    
    return
  }

  

  let permStatus = await PushNotifications.checkPermissions()

  

  if (permStatus.receive === 'prompt') {
    
    permStatus = await PushNotifications.requestPermissions()
    
  }

  if (permStatus.receive !== 'granted') {
    
    return
  }

  
  await PushNotifications.register()

  

  PushNotifications.addListener('registration', async (token) => {
    

    const result = await supabase.auth.getUser()
    const user = result.data.user

    if (!user) {
      
      return
    }

    

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
      
    }
  })

  PushNotifications.addListener('registrationError', (err) => {
    console.error('❌ Registration error:', err)
  })

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    
  })

  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification) => {
      

      const rideId = notification.notification.data?.ride_id

      if (rideId) {
        window.location.href = `/driver?ride=${rideId}`
      } else {
        window.location.href = '/driver'
      }
    }
  )
}