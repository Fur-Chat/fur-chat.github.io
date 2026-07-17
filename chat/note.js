// Chat rules popup

function createChatWarning(){

    if(localStorage.getItem("chatAccepted")){
        return;
    }


    const overlay =
        document.createElement("div");


    overlay.id =
        "chat-warning-overlay";


    overlay.innerHTML = `

    <div id="chat-warning-box">

        <h1>⚠️ Chat Warning</h1>

        <p>
        This chat is NOT moderated.
        Messages are user-generated and may contain
        offensive, inaccurate, or inappropriate content.
        Use this chat at your own risk.
        </p>

        <p style="color:red;font-size:22px;">
        18+ WARNING!
        </p>


        <div id="terms-box">

        <h3>Terms and Conditions</h3>

        <ul>
            <li>You will not post illegal content.</li>
            <li>You will not share private personal information.</li>
            <li>You are responsible for your own messages.</li>
            <li>The owner is not responsible for user messages.</li>
            <li>Your messages may be stored in the database.</li>
            <li>You cannot delete your account.</li>
            <li>You cannot delete your messages.</li>
            <li>You are responsible for your password and email security.</li>
            <li>You must be at least 13 years old.</li>
        </ul>

        </div>


        <label>

            <input 
            type="checkbox" 
            id="terms-check">

            I agree to the Terms and Conditions

        </label>


        <div id="hcaptcha-container"></div>


        <div id="error-text"></div>


        <button id="accept-chat-btn" disabled>
            Enter Chat
        </button>


    </div>

    `;


    document.body.appendChild(overlay);



    const checkbox =
        document.getElementById("terms-check");


    const button =
        document.getElementById("accept-chat-btn");


    const error =
        document.getElementById("error-text");



    let captchaPassed = false;



    function updateButton(){

        button.disabled =
            !(checkbox.checked && captchaPassed);

    }



    checkbox.onchange =
        updateButton;



    function loadCaptcha(){

        if(typeof hcaptcha === "undefined"){

            setTimeout(
                loadCaptcha,
                500
            );

            return;

        }



        hcaptcha.render(
            "hcaptcha-container",
            {
                sitekey:
                "b768af2c-10c4-4efa-a8d6-b1787b0c7ba2",


                callback:function(){

                    captchaPassed = true;

                    updateButton();

                },


                "expired-callback":function(){

                    captchaPassed = false;

                    updateButton();

                },


                "error-callback":function(){

                    captchaPassed = false;

                    error.textContent =
                    "CAPTCHA error. Try again.";

                    updateButton();

                }

            }
        );

    }



    loadCaptcha();



    button.onclick =
    ()=>{

        if(!checkbox.checked || !captchaPassed){

            error.textContent =
            "Please complete the requirements.";

            return;

        }


        localStorage.setItem(
            "chatAccepted",
            "true"
        );


        overlay.remove();

    };

}



// Start popup

createChatWarning();