import '../CSS/footer.css'
import { useNavigate } from 'react-router-dom';

function Footer() {
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/hok')
    }
    const handleBack = () => {
        navigate('/')
    }
    return(
        <footer>
            <div id="footerButtons">
                <button className='homeButton' onClick={handleBack}> &#8592; HOME</button>
                <button className='hokButton' onClick={handleRedirect}>HEAD OF KITCHEN</button>
            </div>
            <br />
            <hr />
            <p>Created and Hosted by Code-de-Sac, LLC. &copy; 2025 </p>
            <p>ALL RIGHTS RESERVED</p>
        </footer>
    );
};

export default Footer;