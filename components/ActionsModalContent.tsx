
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import {useState} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FormattedDateTime } from "./FormattedDateTime";
import { FileDoc } from "@/types/file.types";

const ImageThumbnail = ({ file }: { file: FileDoc }) => (
  <div className="file-details-thumbnail">
    <Thumbnail type={file.type} extension={file.extension} url={file.url} />
    <div className="flex flex-col">
      <p className="mb-1 subtitle-2">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="text-left file-details-label">{label}</p>
    <p className="text-left file-details-value subtitle-2">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: FileDoc }) => {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="px-2 pt-2 space-y-4">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner.fullName} />
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
      </div>
    </>
  );
};

interface Props {
  file: FileDoc;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
   const [error, setError] = useState("");

  const validateAndUpdateEmails = (value: string) => {
    const emails = value
      .trim()
      .split(",")
      .filter((email) => email.length > 0);

    if (emails.length === 0) {
      setError("please enter at least one email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(
      (email) => !emailRegex.test(email.trim())
    );

    if (invalidEmails.length > 0) {
      setError(`Invalid email format: ${invalidEmails.join(", ")}`);
      return;
    }

    setError("");
    onInputChange(emails);
  };

  return (
    <>
      <ImageThumbnail file={file} />

      <div className="share-wrapper">
        <p className="pl-1 subtitle-2 text-light-100">
          Share file with other users
        </p>
        <Input
          type="email"
          placeholder="Enter email address"
          onChange={(e) => validateAndUpdateEmails(e.target.value)}
          className="share-input-field"
        />
        {error && <p className="mt-1 ml-1 text-sm">{error}</p>}
        <div className="pt-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">Shared with</p>
            <p className="subtitle-2 text-light-200">
              {file.users.length} users
            </p>
          </div>

          <ul className="pt-2">
            {file.users.map((email: string) => (
              <li
                key={email}
                className="flex items-center justify-between gap-2"
              >
                <p className="subtitle-2">{email}</p>
                <Button
                  onClick={() => onRemove(email)}
                  className="share-remove-user"
                >
                  <Image
                    src="/assets/icons/remove.svg"
                    alt="Remove"
                    width={24}
                    height={24}
                    className="remove-icon"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};