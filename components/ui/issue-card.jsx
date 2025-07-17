"use client"

import React, { useState } from 'react'
import { Card,CardHeader,CardAction,CardContent,CardTitle,CardFooter} from './card';
import { Badge } from './badge';
import UserAvatar from './user-avatar';
import { formatDistance, formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import IssueDetailsDialog from '../issue-details-dialog';
const priorityColor={
    LOW:"border-green-600",
    MEDIUM:"border-yellow-300",
    HIGH:"border-orange-400",
    CRITICAL:"border-red-400"

};

const IssueCard = ({
    issue,
    showStatus=false,
    onDelete=()=>{},
    onUpdate=()=>{},
}) => {
    const [isDialogOpen,setIsDialogOpen]=useState(false);
    const router=useRouter();
    const onDeleteHandler=(...params)=>{
        router.refresh();
        onDelete(...params);
    }
    const onUpdateHandler=(...params)=>{
        router.refresh();
        onUpdate(...params);
    }

    const created=formatDistanceToNow(new Date(issue.createdAt),{
        addSuffix:true,
    });

    return (
        <>
<Card className={`bg-black cursor-pointer hover:shadow-md transition-shadow rounded-lg overflow-hidden ${priorityColor[issue.priority]} border-t-4`}
onClick={()=>setIsDialogOpen(true)}
>
  
  <CardHeader>
    <CardTitle>{issue.title}</CardTitle>
  </CardHeader>
  <CardContent className="flex gap-2 -mt-3">
    {showStatus && <Badge>{issue.status}</Badge>}
    <Badge variant="secondary" className="-ml-1">
        {issue.priority}
    </Badge>
  </CardContent>
  <CardFooter className="flex flex-col items-start space-y-3">
    <UserAvatar user={issue.assignee}/>
    
    <div className='text-xs text-gray-400 w-full py-2'>
        Created {created}
    </div>
  </CardFooter>
</Card>
{isDialogOpen && (<IssueDetailsDialog
isOpen={isDialogOpen}
onClose={()=>setIsDialogOpen(false)}
issue={issue}
onDelete={onDeleteHandler}
onUpdate={onUpdateHandler}
borderCol={priorityColor[issue.priority]}

/>
)
}
            
        </>
    )
}

export default IssueCard
