import PictureViewer from '../components/PictureViewer';
import Header from '../components/Header';
import Uploader from '../components/Uploader';

export default function Home(){
  return (
    <main>
      <Header />
      <Uploader />
      <PictureViewer />
    </main>
  )
}