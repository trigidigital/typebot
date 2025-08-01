import { DropdownList } from "@/components/DropdownList";
import { PrimitiveList } from "@/components/PrimitiveList";
import { TableList } from "@/components/TableList";
import { TagsInput } from "@/components/TagsInput";
import { NumberInput, TextInput, Textarea } from "@/components/inputs";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormLabel, Stack } from "@chakra-ui/react";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { evaluateIsHidden } from "@typebot.io/forge/helpers/evaluateIsHidden";
import type { ZodLayoutMetadata } from "@typebot.io/zod";
import Markdown, { type Components } from "react-markdown";
import type { ZodTypeAny, z } from "zod";
import { getZodInnerSchema } from "../../helpers/getZodInnerSchema";
import {
  AutocompleteInput,
  ForgeAutocompleteInput,
} from "../ForgeAutocompleteInput";
import { ForgeSelectInput } from "../ForgeSelectInput";
import { ZodDiscriminatedUnionLayout } from "./ZodDiscriminatedUnionLayout";
import { ZodObjectLayout } from "./ZodObjectLayout";

const parseEnumItems = (
  schema: z.ZodTypeAny,
  layout?: ZodLayoutMetadata<ZodTypeAny>,
) => {
  const values = layout?.hiddenItems
    ? schema._def.values.filter((v: string) => !layout.hiddenItems?.includes(v))
    : schema._def.values;
  if (layout?.toLabels)
    return values.map((v: string) => ({
      label: layout.toLabels!(v),
      value: v,
    }));
  return values;
};

const mdComponents = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="md-link"
    >
      {children}
    </a>
  ),
} satisfies Components;

export const ZodFieldLayout = ({
  data,
  schema,
  isInAccordion,
  blockDef,
  blockOptions,
  width,
  propName,
  onDataChange,
}: {
  data: any;
  schema: z.ZodTypeAny;
  isInAccordion?: boolean;
  blockDef?: ForgedBlockDefinition;
  blockOptions?: ForgedBlock["options"];
  width?: "full";
  propName?: string;
  onDataChange: (val: any) => void;
}) => {
  const innerSchema = getZodInnerSchema(schema);
  const layout = innerSchema._def.layout;

  if (evaluateIsHidden(layout?.isHidden, blockOptions)) return null;

  if (layout?.inputType === "variableDropdown") {
    return (
      <VariableSearchInput
        initialVariableId={data}
        onSelectVariable={(variable) => onDataChange(variable?.id)}
        placeholder={layout?.placeholder}
        label={layout?.label}
        moreInfoTooltip={layout.moreInfoTooltip}
        helperText={
          layout?.helperText ? (
            <Markdown components={mdComponents}>{layout.helperText}</Markdown>
          ) : undefined
        }
        width={width}
      />
    );
  }

  switch (innerSchema._def.typeName) {
    case "ZodObject":
      return (
        <ZodObjectLayout
          schema={innerSchema as z.ZodObject<any>}
          data={data}
          onDataChange={onDataChange}
          isInAccordion={isInAccordion}
          blockDef={blockDef}
          blockOptions={blockOptions}
        />
      );
    case "ZodDiscriminatedUnion": {
      return (
        <ZodDiscriminatedUnionLayout
          discriminant={innerSchema._def.discriminator}
          data={data}
          schema={
            innerSchema as z.ZodDiscriminatedUnion<string, z.ZodObject<any>[]>
          }
          dropdownPlaceholder={
            layout?.placeholder ?? `Select a ${innerSchema._def.discriminator}`
          }
          onDataChange={onDataChange}
        />
      );
    }
    case "ZodArray": {
      return (
        <ZodArrayContent
          data={data}
          schema={innerSchema}
          blockDef={blockDef}
          blockOptions={blockOptions}
          layout={layout}
          onDataChange={onDataChange}
        />
      );
    }
    case "ZodEnum": {
      return (
        <DropdownList
          currentItem={data ?? layout?.defaultValue}
          onItemSelect={onDataChange}
          items={parseEnumItems(innerSchema, layout)}
          label={layout?.label}
          helperText={
            layout?.helperText ? (
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            ) : undefined
          }
          moreInfoTooltip={layout?.moreInfoTooltip}
          placeholder={layout?.placeholder}
          direction={layout?.direction}
          width={width}
        />
      );
    }
    case "ZodNumber":
    case "ZodUnion": {
      return (
        <NumberInput
          defaultValue={data ?? layout?.defaultValue}
          label={layout?.label}
          placeholder={layout?.placeholder}
          helperText={
            layout?.helperText ? (
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            ) : undefined
          }
          isRequired={layout?.isRequired}
          moreInfoTooltip={layout?.moreInfoTooltip}
          onValueChange={onDataChange}
          direction={layout?.direction}
          width={width}
          debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
        />
      );
    }
    case "ZodBoolean": {
      return (
        <SwitchWithLabel
          label={layout?.label ?? propName ?? ""}
          initialValue={data ?? layout?.defaultValue}
          onCheckChange={onDataChange}
          moreInfoContent={layout?.moreInfoTooltip}
        />
      );
    }
    case "ZodString": {
      if (layout?.autoCompleteItems) {
        return (
          <AutocompleteInput
            items={layout.autoCompleteItems}
            defaultValue={data ?? layout.defaultValue}
            placeholder={layout.placeholder}
            label={layout.label}
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              ) : undefined
            }
            moreInfoTooltip={layout?.moreInfoTooltip}
            onChange={onDataChange}
            width={width}
            withVariableButton={layout.withVariableButton ?? true}
          />
        );
      }
      if (layout?.fetcher) {
        if (!blockDef) return null;
        if (layout.allowCustomText)
          return (
            <ForgeAutocompleteInput
              defaultValue={data ?? layout.defaultValue}
              placeholder={layout.placeholder}
              fetcherId={layout.fetcher}
              options={blockOptions}
              blockDef={blockDef}
              label={layout.label}
              credentialsScope="workspace"
              helperText={
                layout?.helperText ? (
                  <Markdown components={mdComponents}>
                    {layout.helperText}
                  </Markdown>
                ) : undefined
              }
              moreInfoTooltip={layout?.moreInfoTooltip}
              onChange={onDataChange}
              width={width}
              withVariableButton={layout.withVariableButton ?? true}
            />
          );
        return (
          <ForgeSelectInput
            defaultValue={data ?? layout.defaultValue}
            placeholder={layout.placeholder}
            fetcherId={layout.fetcher}
            options={blockOptions}
            blockDef={blockDef}
            label={layout.label}
            credentialsScope="workspace"
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              ) : undefined
            }
            moreInfoTooltip={layout?.moreInfoTooltip}
            onChange={onDataChange}
            width={width}
            withVariableButton={layout.withVariableButton ?? true}
          />
        );
      }
      if (layout?.inputType === "textarea") {
        return (
          <Textarea
            defaultValue={data ?? layout?.defaultValue}
            label={layout?.label}
            placeholder={layout?.placeholder}
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              ) : undefined
            }
            isRequired={layout?.isRequired}
            withVariableButton={layout?.withVariableButton}
            moreInfoTooltip={layout.moreInfoTooltip}
            onChange={onDataChange}
            width={width}
            debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
          />
        );
      }

      if (layout?.inputType === "code")
        return (
          <CodeEditor
            defaultValue={data ?? layout?.defaultValue}
            lang={layout.lang ?? "javascript"}
            label={layout?.label}
            placeholder={layout?.placeholder}
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              ) : undefined
            }
            isRequired={layout?.isRequired}
            withVariableButton={layout?.withVariableButton}
            moreInfoTooltip={layout.moreInfoTooltip}
            onChange={onDataChange}
            width={width}
            debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
            withLineNumbers={true}
          />
        );
      return (
        <TextInput
          defaultValue={data ?? layout?.defaultValue}
          label={layout?.label}
          placeholder={layout?.placeholder}
          helperText={
            layout?.helperText ? (
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            ) : undefined
          }
          type={layout?.inputType === "password" ? "password" : undefined}
          isRequired={layout?.isRequired}
          withVariableButton={layout?.withVariableButton}
          moreInfoTooltip={layout?.moreInfoTooltip}
          onChange={onDataChange}
          width={width}
          debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
        />
      );
    }
    default:
      return null;
  }
};

const ZodArrayContent = ({
  schema,
  data,
  blockDef,
  blockOptions,
  layout,
  isInAccordion,
  onDataChange,
}: {
  schema: z.ZodTypeAny;
  data: any;
  blockDef?: ForgedBlockDefinition;
  blockOptions?: ForgedBlock["options"];
  layout: ZodLayoutMetadata<ZodTypeAny> | undefined;
  isInAccordion?: boolean;
  onDataChange: (val: any) => void;
}) => {
  const type = schema._def.type._def.innerType?._def.typeName;
  if (type === "ZodString" || type === "ZodNumber" || type === "ZodEnum")
    return (
      <Stack
        spacing={0}
        marginTop={layout?.mergeWithLastField ? "-3" : undefined}
      >
        {layout?.label && <FormLabel>{layout.label}</FormLabel>}
        <Stack
          p="4"
          rounded="md"
          flex="1"
          borderWidth="1px"
          borderTopWidth={layout?.mergeWithLastField ? "0" : undefined}
          borderTopRadius={layout?.mergeWithLastField ? "0" : undefined}
          pt={layout?.mergeWithLastField ? "5" : undefined}
        >
          {type === "ZodString" ? (
            <TagsInput items={data} onChange={onDataChange} />
          ) : (
            <PrimitiveList
              onItemsChange={(items) => {
                onDataChange(items);
              }}
              initialItems={data}
              addLabel={`Add ${layout?.itemLabel ?? ""}`}
            >
              {({ item, onItemChange }) => (
                <ZodFieldLayout
                  schema={schema._def.type}
                  data={item}
                  blockDef={blockDef}
                  blockOptions={blockOptions}
                  isInAccordion={isInAccordion}
                  onDataChange={onItemChange}
                  width="full"
                />
              )}
            </PrimitiveList>
          )}
        </Stack>
      </Stack>
    );
  return (
    <TableList
      onItemsChange={(items) => {
        onDataChange(items);
      }}
      initialItems={data}
      addLabel={`Add ${layout?.itemLabel ?? ""}`}
      isOrdered={layout?.isOrdered}
    >
      {({ item, onItemChange }) => (
        <Stack p="4" rounded="md" flex="1" borderWidth="1px" maxW="100%">
          <ZodFieldLayout
            schema={schema._def.type}
            blockDef={blockDef}
            blockOptions={blockOptions}
            data={item}
            isInAccordion={isInAccordion}
            onDataChange={onItemChange}
          />
        </Stack>
      )}
    </TableList>
  );
};
