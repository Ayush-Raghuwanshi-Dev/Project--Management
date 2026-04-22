import React from 'react'
import { Link } from 'react-router'
import type { Route } from './+types/home'
import { Button } from '@/components/ui/button'

export function meta({} : Route.MetaArgs) {
    return [
        { title: "TaskHub" },
        { name: "description", content: "Task management app" }
    ]
}

function Homepage() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 h-screen">
      <div className="flex gap-4">
        <Link to="/sign-in">
          <Button className="bg-blue-500 hover:bg-blue-700 text-white">Login</Button>
        </Link>
        <Link to="/sign-up">
          <Button className="bg-green-500 hover:bg-green-700 text-white">Sign Up</Button>
        </Link>
      </div>
    </div>
  )
}

export default Homepage