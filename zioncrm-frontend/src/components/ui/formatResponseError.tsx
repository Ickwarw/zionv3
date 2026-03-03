import axios, { AxiosError } from "axios";


export function formatAxiosError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    // Type is now narrowed to AxiosError
    const axiosErr = err as AxiosError<any>;

    if (axiosErr.response) {
      // ✅ full response from backend
      const status = axiosErr.response.status;
      const statusText = axiosErr.response.statusText;
      const data = axiosErr.response.data;

      // try to use backend message if available
      if (typeof data === "object" && data !== null && "message" in data) {
        return (data as { message: string }).message;
      }

      return `Erro ${status}: ${statusText}`;
    }

    if (axiosErr.request) {
      // ✅ request sent but no response
      return "Servidor não está respondendo.";
    }

    // ✅ Something went wrong before request (bad config, etc.)
    return `Erro na requisição ao servidor: ${axiosErr.message}`;
  }

  // not an Axios error (could be a throw from your own code)
  console.log("Um erro inesperado aconteceu.", err);
  return "Um erro inesperado aconteceu.";
}

