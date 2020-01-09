document.getElementById("button").addEventListener("click",(event)=>{
      // event.preventDefault();
    
    
    var email=document.getElementById("myform").elements.namedItem("email").value;
    var password=document.getElementById("myform").elements.namedItem("password").value;
    var username=document.getElementById("myform").elements.namedItem("username").value;
    var confirmPassword=document.getElementById("myform").elements.namedItem("confirm").value;
    
    
        if(username==""){
            alert("Please enter username");
            event.preventDefault();
        }
    
       else if(email==""){
            alert("Please enter your email");
            event.preventDefault();
        }

        else if(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/.test(email) === false) {
            alert("Please enter a valid email");
            event.preventDefault();
        }
    
       else if(password==""){
            alert("Please enter a password");
            event.preventDefault();
        }
    
       else if(password.length<6){
            alert("Password must be atleast 6 characters long");
            event.preventDefault();
        }
    
        else if(confirmPassword==""){
            alert("Confirm your password");
            event.preventDefault();
        }
      else  if(password!=confirmPassword){
            alert("Passwords must match!");
            event.preventDefault();
        }
    
    })