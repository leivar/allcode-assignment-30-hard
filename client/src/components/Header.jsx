import { useNavigate } from 'react-router';

export default function Header() {

    const navigate = useNavigate();
    
    return (
    <header>
        <nav className="md:p-4 flex justify-between w-full border-b-4 border-dashed rounded-b-xl">
            <section className="text-4xl font-bold"><button className='' onClick={() => navigate('/')}>CloudCity</button></section>
            <section className="flex flex-col">
                <button className="cursor-pointer font-bold border-1 hover:bg-white hover:text-indigo-800 border-white w-[120px] rounded" onClick={() => navigate('/login')}>Log In</button>
                <button className="cursor-pointer font-bold border-1 hover:bg-white hover:text-indigo-800 border-white w-[120px] rounded" onClick={() => navigate('/register')}>Register</button>
            </section>
        </nav>
    </header>
    )
}