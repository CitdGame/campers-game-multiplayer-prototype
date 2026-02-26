package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Player struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Money int    `json:"money"`
	Slots int    `json:"slots"`
	Elect int    `json:"electric"`
	Water int    `json:"water"`
}

type GameState struct {
	Players []Player `json:"players"`
	Year    int      `json:"year"`
	Quarter int      `json:"quarter"`
	Round   int      `json:"round"`
	Event   string   `json:"event"`
}

type Client struct {
	conn     *websocket.Conn
	send     chan []byte
	lobby    string
	playerID string
}

type Lobby struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	gameState  GameState
	mu         sync.RWMutex
}

func newLobby() *Lobby {
	return &Lobby{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		gameState: GameState{
			Players: make([]Player, 0),
			Year:    1,
			Quarter: 1,
			Round:   1,
		},
	}
}

func (l *Lobby) run() {
	for {
		select {
		case client := <-l.register:
			l.mu.Lock()
			l.clients[client] = true
			l.mu.Unlock()
		case client := <-l.unregister:
			l.mu.Lock()
			if _, ok := l.clients[client]; ok {
				delete(l.clients, client)
				close(client.send)
			}
			l.mu.Unlock()
		case message := <-l.broadcast:
			l.mu.RLock()
			for client := range l.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(l.clients, client)
				}
			}
			l.mu.RUnlock()
		}
	}
}

var lobbies = make(map[string]*Lobby)

func serveWs(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	client := &Client{
		conn: ws,
		send: make(chan []byte, 256),
	}

	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		// TODO: remove from lobby
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error: %v", err)
			}
			break
		}

		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		// Handle message types
		switch msg["type"] {
		case "createLobby":
			// TODO: Implement
		case "joinLobby":
			// TODO: Implement
		case "startGame":
			// TODO: Implement
		case "endTurn":
			// TODO: Implement
		}
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()
	for {
		message, ok := <-c.send
		if !ok {
			c.conn.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			return
		}
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Serve static files
	fs := http.FileServer(http.Dir("public"))
	http.Handle("/", fs)

	// WebSocket endpoint
	http.HandleFunc("/ws", serveWs)

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
