export interface SetlistSong {
  id: string
  title: string
  artist: string
  bpm: number | null
  key: string | null
  notes: string
  duration: string  // format "m:ss", np. "3:45"
}

export interface Setlist {
  id: string
  name: string
  songs: SetlistSong[]
  createdAt: string
}
