' Starts the ServiceOps portal at logon, with no console window.
'
' A copy of this file lives in the Startup folder, so the dev server is back before
' you look for it after a restart. It starts nothing if the port is already answering,
' so logging out and back in cannot leave two servers fighting over port 5199.
'
' To stop it starting at logon: delete "ServiceOps portal.vbs" from
'   %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

Dim shell, fso, projectDir, http
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

projectDir = "C:\Users\Nikhil Khemaria\Test4\SO\serviceops-ticket-detail-main"

' Already answering? Then leave it alone. (--strictPort would refuse the port anyway,
' but failing silently at every logon is not the same as deciding not to start.)
On Error Resume Next
Set http = CreateObject("MSXML2.XMLHTTP")
http.Open "GET", "http://localhost:5199/", False
http.Send
If Err.Number = 0 And http.Status = 200 Then WScript.Quit
Err.Clear
On Error GoTo 0

If Not fso.FolderExists(projectDir) Then
  ' Moved or renamed: say so once rather than failing silently at every logon.
  MsgBox "ServiceOps portal could not start — the project folder has moved:" & vbCrLf & vbCrLf & _
         projectDir & vbCrLf & vbCrLf & _
         "Update the path in portal-autostart.vbs, or delete this file from the Startup folder.", _
         48, "ServiceOps portal"
  WScript.Quit
End If

' 0 = hidden window, False = do not wait. Vite keeps running in the background.
shell.CurrentDirectory = projectDir
shell.Run "cmd /c npx vite --port 5199 --strictPort", 0, False
