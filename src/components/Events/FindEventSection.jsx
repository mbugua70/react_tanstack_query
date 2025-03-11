import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEventsBySearch } from "../../util/http";
import LoadingIndicator from "../UI/LoadingIndicator";
import ErrorBlock from "../UI/ErrorBlock";
import EventItem from "./EventItem";

export default function FindEventSection() {
  const searchElement = useRef();
  // refs are not like state value they don't make the component to reexercute, hence we have use searchTerm in the queryKey for dynamic data fetch
  const [searchTerm, setSearchTerm] = useState();

  // react query implementation

  const { data, isLoading, isError, error } = useQuery({
    // below in the queryKey we can't use the same name as in the newEventSection since react query will treat this event the same hence show the same data of newEventSection

    queryKey: ["events", { search: searchTerm }],
    queryFn: () => fetchEventsBySearch(searchTerm),
    // the property below is used to disable default searching of data.
    enabled: searchTerm !== undefined,
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term and to find events.</p>;

  if (isLoading) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title='An Error occured'
        message={error.info?.message || "Failed to fetch data"}
      />
    );
  }

  if (data) {
    content = (
      <ul className='events-list'>
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className='content-section' id='all-events-section'>
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id='search-form'>
          <input
            type='search'
            placeholder='Search events'
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
