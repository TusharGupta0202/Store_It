import Image from 'next/image'
import { Button } from './ui/button'
import Search from './Search'
import FileUploader from './FileUploader'
import { signOutUser } from '@/lib/actions/user.actions'

const Header = ({ userId, accountId }: { userId: string; accountId: string }) => {
  return (
    <header className="header">
        <Search />
        <div className='header-wrapper flex-center'>
            <FileUploader ownerId={userId} accountId={accountId}  /> 

            <form action={async () => {
                'use server'
                await signOutUser();                
            }}  >
                <Button type='submit' className='sign-out-button flex-center' >
                    <Image src='/assets/icons/logout.svg' alt='sign out' width={20} height={20} />
                </Button>
            </form>
        </div>
    </header>
  )
}

export default Header