type Props = {
  message?: string;
};

/**
 * Shows the [Confused Travolta](https://knowyourmeme.com/memes/confused-travolta) gif with a header.
 */
export const MissingSomethingResponse = ({
  message = "What's your BGG username?",
}: Props) => (
  <section className="max-w-sm p-4 xl:max-w-7xl">
    <h2 className="mt-0">{message}</h2>
    <div className="relative h-0 w-full" style={{ paddingBottom: "43%" }}>
      <iframe
        src="https://giphy.com/embed/3o7aTskHEUdgCQAXde"
        width="100%"
        height="100%"
        frameBorder="0"
        className="giphy-embed absolute"
        allowFullScreen
      ></iframe>
    </div>
    <p>
      <a href="https://giphy.com/gifs/quentin-tarantino-pulp-fiction-vincent-vega-3o7aTskHEUdgCQAXde">
        via GIPHY
      </a>
    </p>
  </section>
);
