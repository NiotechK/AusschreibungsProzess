import emailjs from 'emailjs-com'

const Mailer = () => {

    function sendEmail(e) {
        e.preventDefault();
        emailjs.sendForm(
        'service_f70zg1e',
        'template_fpp51bb',
         e.target,
         'b0FZ3wiTe2Hn9CZy7').then(res=>{
             console.log(res);
         }).catch(err=>console.log(err));
    }
    return (
        <div>
            <form onSubmit={sendEmail}>
                <input placeholder="E-Mail" type="email" name ="user_email" />
                <input type="submit" value='Send'/>
            </form>
        </div>
    );

};
export default Mailer;