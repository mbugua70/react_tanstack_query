// importing the tanstack methods and properties for use

import  {useQuery} from "@tanstack/react-query";
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection() {
  // const [data, setData] = useState();
  // const [error, setError] = useState();
  // const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   async function fetchEvents() {
  //     setIsLoading(true);
  //     const response = await fetch('http://localhost:3000/events');

  //     if (!response.ok) {
  //       const error = new Error('An error occurred while fetching the events');
  //       error.code = response.status;
  //       error.info = await response.json();
  //       throw error;
  //     }

  //     const { events } = await response.json();

  //     return events;
  //   }

  //   fetchEvents()
  //     .then((events) => {
  //       setData(events);
  //     })
  //     .catch((error) => {
  //       setError(error);
  //     })
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // }, []);

  // we are going to use react query instead of useEffect

  const { data, isError, isPending, error } = useQuery({
    // the react queryKey is used to help in caching, hence if fetchEvents fetches the data for the first, it won't have to fetch the data once more.
    // the data fetched will be stored by react query
    // you can also configure how long the data stored by react query should be cached.
    // it has a value of array
    // queryKey is mostly used for caching of data, hence the next time the request is fetched the cached data will be the one to be fetched.
    queryKey: ["events"],
    // the function below expect a promise/ fetch function functionality
    queryFn: fetchEvents,
    // staletime is used to set after how long react query should update the new data backend .
    staleTime: 5000,
    // the key below is used to set how long the data should be cached in react query,
    // gcTime: 1000,
  });


  let content;

  // instead of using isLoading we will isPending frm the react query

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock title="An error occurred" message={error.info?.message || "Failed to fetch data"} />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (


    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
