import axiosInstance from './axios'

const ADMIN_ACCESS_LOG_ENDPOINT = '/admin/evidence-access-log'

export const adminAPI = {
  getAccessLog: async (params = {}) => {
    const response = await axiosInstance.get(ADMIN_ACCESS_LOG_ENDPOINT, { params })
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data || {}
  },

  getAccessLogStats: async () => {
    const response = await axiosInstance.get(`${ADMIN_ACCESS_LOG_ENDPOINT}/stats`)
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data || {}
  },

  exportAccessLog: async (params = {}) => {
    const response = await axiosInstance.get(`${ADMIN_ACCESS_LOG_ENDPOINT}/export`, {
      params,
      responseType: 'blob',
    })

    const blob = response.data
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = 'evidence_access_log.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)

    return blob
  },
}
