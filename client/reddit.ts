export interface RedditResponse {
  data: {
    children: {
      data: RedditPost
    }[]
  }
}

export interface RedditPost {
  title: string;
  url: string;
  created_utc: number;
}
