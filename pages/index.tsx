import { FormEventHandler, useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import { Button, Classes, InputGroup, Intent, Text } from "@blueprintjs/core";
import { CopyToClipboard } from "react-copy-to-clipboard";
import clsx from "clsx";

import { showErrorToast } from "utils/toasts";

type Error = {
  status: number;
  statusText: string;
};

type Data = {
  title: string;
  description: string;
  directions: string;
};

type Timeout = ReturnType<typeof setTimeout>;

const TextCopy = ({ title, text }: { title: string; text: string }) => {
  const [copied, setCopied] = useState(false);

  const timeoutRef = useRef<Timeout>();

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current as Timeout);
  }, []);

  const handleCopy = () => {
    setCopied(true);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <>
      <Text className="flex items-center font-semibold">
        {title}
        <CopyToClipboard text={text} onCopy={handleCopy}>
          <Button
            className="ml-2 transition-colors focus:outline-none"
            icon={copied ? "tick" : "duplicate"}
            intent={copied ? Intent.WARNING : Intent.NONE}
          />
        </CopyToClipboard>
        <Text tagName="span" className="text-gray-400 ml-1 font-light text-xs">
          {copied ? "Copied!" : ""}
        </Text>
      </Text>
      <Text className={clsx("mb-6", Classes.RUNNING_TEXT, Classes.TEXT_LARGE)} tagName="p">
        {text}
      </Text>
    </>
  );
};

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<Data>({
    title: "",
    description: "",
    directions: ""
  });

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const url = formData.get("url") as string;

      const { data }: { data: Data } = await fetch(
        `/api/import?url=${encodeURIComponent(url)}`
      ).then((res) => {
        if (!res.ok) {
          throw {
            status: res.status,
            statusText: res.statusText
          };
        }

        return res.json();
      });

      setSuccess(true);
      setData(data);
    } catch (error) {
      console.log(error);

      if ((error as Error).status === 404) {
        showErrorToast("No recipe found");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setSuccess(false);
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="container flex flex-col justify-center items-center">
        <h1 className="text-2xl italic mb-10">Extract recipe details from a URL</h1>

        <form className="w-4/5 flex" onSubmit={onSubmit} onReset={onReset}>
          <InputGroup
            className="flex-1 mr-1"
            name="url"
            type="url"
            placeholder="https://example.com"
            rightElement={
              <Button
                className="focus:outline-none"
                icon="cross"
                type="reset"
                minimal
                disabled={loading}
              />
            }
            required
            large
            disabled={loading}
          />
          <Button
            className="transition-colors"
            type="submit"
            text={success ? "Success" : "Extract"}
            rightIcon={success ? "tick" : undefined}
            large
            intent={success ? Intent.SUCCESS : Intent.PRIMARY}
            loading={loading}
          />
        </form>

        {success && (
          <div className="w-4/5 mt-6">
            <TextCopy title="Recipe" text={data.title} />
            <TextCopy title="Description" text={data.description} />
            <TextCopy title="Directions" text={data.directions} />
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
