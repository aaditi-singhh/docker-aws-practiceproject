import "./App.css"
import {Editor} from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"  //editor se connect ho jati hai toh user jo change karenge toh baki user pe jake broadcast ho jati hai update hote rehti hai..
import { useRef, useMemo } from "react"  //usememo for creating ydoc
import * as Y from "yjs"
import { SocketIOProvider} from "y-socket.io"

function App() {


  const editorRef = useRef(null)
   

  const ydoc = useMemo(() => new Y.Doc() , []) 
  //if you have multiple files unn sabko ko ydoc mein store kiya jata hai 
  // then ydoc ke help se yjs compare karta hai ki tumne jo changes kiye hai 
  // fir delta nikalta hai ki jo pehle se tha aur tumne jo changes kiye hai delta nikalta hai woh 
  // sird server pe jata hai .. server sirf woh delta hai baki sare pe rovide karta hai or broadcast karta hai
  //jitne vi files or code woh sabko doc mein store karta hai uses yjs.. koi kuch vi change karta hai usko ydoc mein store karta hai
  const yText = useMemo(() => ydoc.getText("monaco") , [ydoc]) //agar singlefile ka data chahiye ytext woh tumhe provide krta hai 



  const handleMount = ( editor ) => {
    editorRef.current = editor


    //socketio rovider user aur server ke bich ka connection provide
  const provider = new SocketIOProvider("http://localhost:3000" , "monaco" ,ydoc,{ //apka editor jo frontend mein hai user aur server ka connection stabilize karne ka kam karte hai
  autoConnect: true,
  })
    const monacoBinding = new MonacoBinding(  //editor aur yjs dono ko connect karta hai taki jo editor edit karta hai server ke tthrough dushre user ko broadcast karta hai
    yText,
    editorRef.current.getModel(),
    new Set ([editorRef.current]),
    provider.awareness        //konsa user connect hai..jitne bhi user yjs ke help se same editor pe rehte hai sync rehte hai unn sabki details ismein rehti hai 
  )
  }
 

  return (
    <main
    className="h-screen w-full bg-gray-950 flex gap-4 p-4"> 
    <aside className = "h-full w-1/4 bg-amber-50 rounded-lg">
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
