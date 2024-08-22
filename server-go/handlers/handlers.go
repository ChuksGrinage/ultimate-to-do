package handlers


func(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, 200, MyData{"Hello World!"})
}