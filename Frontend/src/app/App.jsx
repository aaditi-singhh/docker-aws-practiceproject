import "./App.css"
import {Editor} from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"  //editor se connect ho jati hai toh user jo change karenge toh baki user pe jake broadcast ho jati hai update hote rehti hai..
import { useRef, useMemo, useState , useEffect  } from "react"  //usememo for creating ydoc
import * as Y from "yjs"
import { SocketIOProvider} from "y-socket.io"

function App() {


  const editorRef = useRef(null)
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""  //load karne pe same page mein rehega
  })


  const [users, setUsers] = useState([]) //user store karne ke liye list

  const ydoc = useMemo(() => new Y.Doc() , []) 
  //if you have multiple files unn sabko ko ydoc mein store kiya jata hai 
  // then ydoc ke help se yjs compare karta hai ki tumne jo changes kiye hai 
  // fir delta nikalta hai ki jo pehle se tha aur tumne jo changes kiye hai delta nikalta hai woh 
  // sird server pe jata hai .. server sirf woh delta hai baki sare pe rovide karta hai or broadcast karta hai
  //jitne vi files or code woh sabko doc mein store karta hai uses yjs.. koi kuch vi change karta hai usko ydoc mein store karta hai
  const yText = useMemo(() => ydoc.getText("monaco") , [ydoc]) //agar singlefile ka data chahiye ytext woh tumhe provide krta hai 



  const handleMount = ( editor ) => {
    editorRef.current = editor

    const monacoBinding = new MonacoBinding(  //editor aur yjs dono ko connect karta hai taki jo editor edit karta hai server ke tthrough dushre user ko broadcast karta hai
    yText,
    editorRef.current.getModel(),
    new Set ([editorRef.current]),
    //provider.awareness        //konsa user connect hai..jitne bhi user yjs ke help se same editor pe rehte hai sync rehte hai unn sabki details ismein rehti hai 
  )
}

    
 
const handleJoin = (e) => {
  e.preventDefault()
  setUsername(e.target.username.value)
  window.history.pushState({}, "" , "?username=" + e.target.username.value) //ye karne se reload hone pe tumhara log in ka url banega taki save rahe sab
}



useEffect (() => {

  console.log(username)


  if(username){

    //socketio rovider user aur server ke bich ka connection provide
  const provider = new SocketIOProvider("http://localhost:3000" , "monaco" ,ydoc,{ //apka editor jo frontend mein hai user aur server ka connection stabilize karne ka kam karte hai
  autoConnect: true,
  })

  provider.awareness.setLocalStateField("user" , {username})  //jitne vi user honge unn sabhi ko pehle join karne se username set karna he rehega.. log in ke baad user ka name setlocalstate mein set ho jayega


const states = Array.from(provider.awareness.getStates().values())

console.log(states)


setUsers(states.filter(state=> state.user && state.user.username).map(state => state.user))




  provider.awareness.on("change" , () => {   //awareness se kitne user connected hai kitne users ja chuke hai sab batata hai on change pe batata hai 
    
  const states = Array.from(provider.awareness.getStates().values())
    setUsers(states.filter (state => state.user && state.user.username).map(state => state.user))
  
  })

  function handleBeforeUnload(){
    provider.awareness.setLocalStateField("user", null)

  }
  
  window.addEventListener("beforeunload" , handleBeforeUnload)  // before unload--- refresh karne se pehle  ye kam karega..ensures agar koi user refresh ki page unload then yjs se sabhi condition null then return karenge .destroy .disconnect .remove event listen
   
    


  return () => {
    
    provider.disconnect()
    window.removeEventListener("beforeunload" , handleBeforeUnload)
  }
  
  }
}, [
 
  username
])






  if(!username){
    return (
      <main className=" h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center" >
        <form 
        onSubmit = {handleJoin}
        className = "flex flex-col gap-4">
          <input
          type ="text"
          placeholder ="Enter your username"
          className="p-2 rounded-lg bg-gray-800 text-white"
          name ="username"
        />
        <button
        className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
        >
          Join
        </button>
        </form>
      </main>
    )
  }

  return (
    <main
    className="h-screen w-full bg-gray-950 flex gap-4 p-4"> 
    <aside 
    className = "h-full w-1/4 bg-amber-50 rounded-lg">
      <h2 className="text-2xl font-bold p-4 border-b border-gray-300"> Users </h2>
      <ul className = "p-4">
        {users.map((user , index) => (
          <li key = {index} className = "p-2 bg-gray-800 text-white rounded mb-2">
            {user.username}
          </li>
        ))}
      </ul>

    </aside>
    
    <section
    className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
    

    <Editor
      height ="100%"
      defaultLanguage="javascript"
      defaultValue="// some comment"
      theme ="vs-dark"
      onMount = {handleMount}
      />
    
    </section>
    
    
    </main>



   
  )
}

export default App
