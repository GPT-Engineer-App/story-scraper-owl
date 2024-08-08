import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ThumbsUp, MessageSquare } from 'lucide-react';

const fetchTopStories = async () => {
  const response = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=100');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['topStories'],
    queryFn: fetchTopStories,
  });

  const handleComment = (id, comment) => {
    setComments(prevComments => ({
      ...prevComments,
      [id]: [...(prevComments[id] || []), comment]
    }));
  };

  const filteredStories = data?.hits.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) return <div className="text-center text-red-500">An error occurred: {error.message}</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-center">Top 100 Hacker News Stories</h1>
      <Input
        type="text"
        placeholder="Search stories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-8 max-w-md mx-auto"
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array(9).fill().map((_, index) => (
              <Card key={index} className="flex flex-col justify-between">
                <CardHeader>
                  <Skeleton className="h-4 w-[250px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-[200px]" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-[100px]" />
                </CardFooter>
              </Card>
            ))
          : filteredStories?.map(story => (
              <Card key={story.objectID} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>{story.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{story.points} points</span>
                  </div>
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 text-blue-500 hover:underline"
                  >
                    Read more <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                  <div className="mb-2">
                    {comments[story.objectID]?.map((comment, index) => (
                      <p key={index} className="text-sm text-gray-600 mb-1">{comment}</p>
                    ))}
                  </div>
                  <div className="flex w-full">
                    <Input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-grow mr-2"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          handleComment(story.objectID, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        if (input.value.trim()) {
                          handleComment(story.objectID, input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default Index;
