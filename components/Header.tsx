import Image from 'next/image'
import { Button } from './ui/button'
import Search from './Search'
import FileUploader from './FileUploader'

const Header = () => {
  return (
    <header className="header">
        <Search />
        <div className='header-wrapper flex-center'>
            <FileUploader /> 

            <form>
                <Button type='submit' className='sign-out-button flex-center' >
                    <Image src='/assets/icons/logout.svg' alt='sign out' width={20} height={20} />
                </Button>
            </form>
        </div>
    </header>
  )
}

export default Header