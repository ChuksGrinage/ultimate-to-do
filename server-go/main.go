package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	dat, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Failed to marshal JSON response: %v", payload)
		w.WriteHeader(500)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(dat)
}

type MyData struct {
	Data string `json:"data"`
}  

func main() {
	r := chi.NewRouter()
    r.Use(middleware.Logger)


    r.Get("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello World!"))
    })
	r.Get("/ping", func(w http.ResponseWriter, r *http.Request) {
		respondWithJSON(w, 200, MyData{ "pong 🏓" })
	})
    http.ListenAndServe(":8080", r)
}