// API client for backend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }
    if (this.token) {
      (headers as any).Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })
    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshed = await this.refreshToken()
      if (refreshed) {
        // Retry the original request
        (headers as any).Authorization = `Bearer ${this.token}`
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        })
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`)
        }
        return retryResponse.json()
      } else {
        // Refresh failed, clear tokens and redirect to login
        this.clearToken()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        throw new Error("Authentication failed")
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error ${response.status}:`, errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null
    if (!refreshToken) return false

    try {
      const response = await fetch(`${this.baseURL}/auth/login/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        this.setToken(data.access)
        return true
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
    }

    return false
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Login error:", errorData)
      throw new Error(errorData.detail || errorData.message || "Invalid credentials")
    }

    const data = await response.json()
    console.log("Login successful:", data) // Debug log

    this.setToken(data.access)

    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", data.refresh)
    }

    return data
  }

  async logout() {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null
    if (refreshToken) {
      try {
        await this.request("/auth/logout/", {
          method: "POST",
          body: JSON.stringify({ refresh: refreshToken }),
        })
      } catch (error) {
        console.error("Logout error:", error)
      }
    }
    this.clearToken()
  }

  // User endpoints
  async getCurrentUser() {
    // This endpoint might not exist in your backend
    // We'll handle user data in the login response instead
    return null
  }

  // Persona endpoints
  async getPersonas() {
    return this.request<any[]>("/persona/")
  }

  async getPersona(id: string) {
    return this.request<any>(`/persona/${id}/`)
  }

  async createPersona(data: any) {
    return this.request<any>("/persona/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updatePersona(id: string, data: any) {
    return this.request<any>(`/persona/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deletePersona(id: string) {
    return this.request<any>(`/persona/${id}/`, {
      method: "DELETE",
    })
  }

  // Financial transactions endpoints
  async getFinancialTransactions(personaId?: string) {
    const params = personaId ? `?persona_id=${personaId}` : ""
    return this.request<any[]>(`/financial-transactions/${params}`)
  }

  async getFinancialTransaction(id: string) {
    return this.request<any>(`/financial-transactions/${id}/`)
  }

  async createFinancialTransaction(data: any) {
    return this.request<any>("/financial-transactions/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateFinancialTransaction(id: string, data: any) {
    return this.request<any>(`/financial-transactions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteFinancialTransaction(id: string) {
    return this.request<any>(`/financial-transactions/${id}/`, {
      method: "DELETE",
    })
  }

  // Conversation endpoints
  async getConversations(personaId?: string) {
    const params = personaId ? `?persona_id=${personaId}` : ""
    return this.request<any[]>(`/conversations/${params}`)
  }

  async getConversation(id: string) {
    return this.request<any>(`/conversations/${id}/`)
  }

  async createConversationMessage(data: any) {
    return this.request<any>("/conversations/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateConversationMessage(id: string, data: any) {
    return this.request<any>(`/conversations/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteConversationMessage(id: string) {
    return this.request<any>(`/conversations/${id}/`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
