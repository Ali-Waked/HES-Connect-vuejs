import axiosClient from '../axiosClient'

export function getHomeData() {
  return axiosClient.get('/home')
}
