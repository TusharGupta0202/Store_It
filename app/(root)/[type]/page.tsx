
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.actions";
import Card from "@/components/Card";
import { getFileTypesParams } from "@/lib/utils";
import { FileDoc } from "@/types/file.types";


const Page = async ({ searchParams, params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const types = getFileTypesParams(type) as FileType[];

  const files = await getFiles({ types, searchText, sort });

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="capitalize h1">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">0 MB</span>
          </p>

          <div className="sort-container">
            <p className="hidden body-1 text-light-200 sm:block">Sort by:</p>

            <Sort />
          </div>
        </div>
      </section>

      {/* Render the files */}
      {files && files.total > 0 ? (
        <section className="file-list">
          {files.rows.map((file: FileDoc) => (
             <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list body-1">No files uploaded</p>
      )}
    </div>
  );
};

export default Page;