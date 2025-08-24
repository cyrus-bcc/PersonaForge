// Debug utility to test API endpoints
import { apiClient } from "./api-client"

export async function debugApiEndpoints() {
  console.log("🔍 Testing API endpoints...")

  try {
    // Test personas endpoint
    console.log("Testing GET /persona/...")
    const personas = await apiClient.getPersonas()
    console.log("✅ Personas endpoint working:", personas.length, "personas found")

    // Test specific persona if any exist
    if (personas.length > 0) {
      const firstPersona = personas[0]
      console.log("Testing GET /persona/{id}...")
      const persona = await apiClient.getPersona(firstPersona.id)
      console.log("✅ Single persona endpoint working:", persona.name)
    }

    return { success: true, message: "All endpoints working" }
  } catch (error: any) {
    console.error("❌ API Error:", error.message)

    // Check if it's a 404 error
    if (error.message.includes("404")) {
      console.log("🔍 Checking available endpoints...")

      // Try different endpoint variations
      const variations = ["/persona/", "/personas/", "/api/v1/persona/", "/api/v1/personas/"]

      for (const endpoint of variations) {
        try {
          const response = await fetch(`http://localhost:8000${endpoint}`)
          console.log(`${endpoint}: ${response.status}`)
        } catch (e) {
          console.log(`${endpoint}: Connection failed`)
        }
      }
    }

    return { success: false, error: error.message }
  }
}

// Call this in browser console to debug
if (typeof window !== "undefined") {
  ;(window as any).debugApi = debugApiEndpoints
}
