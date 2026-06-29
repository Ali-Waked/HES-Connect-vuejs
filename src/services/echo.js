import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

import axiosClient from '@/axiosClient';

export const echo = new Echo({
  broadcaster: 'pusher',
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  forceTLS: true,
  encrypted: true,
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        axiosClient
          .post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => {
            callback(false, response.data);
          })
          .catch((error) => {
            console.error('Pusher auth failed', error);
            callback(true, error);
          });
      },
    };
  },
});
