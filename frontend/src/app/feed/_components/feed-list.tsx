import { PostItem, PostData } from "./post-item";

interface FeedListProps {
  posts: PostData[];
}

export const FeedList = ({ posts = [] }: FeedListProps) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        Nenhuma publicação ainda. Seja o primeiro a postar!
      </div>
    );
  }

  return (
    <div className="divide-y">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};
