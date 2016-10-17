module Taglist
    class TagPage < Jekyll::Page
        def initialize(site, base, dir, name, data = {})
            self.content = data.delete('content') || ''
            self.data    = data
            super(site, base, dir, name)
            
        end

        def read_yaml(*)
            # Do nothing
        end
    end

    class Generator < Jekyll::Generator
        def generate(site)
            @site = site

            # Generate tag pages
            site.tags.each { |tag, posts| create_new_tag(tag, posts)} 
        end
        
        def jekyll_tagging_slug(str)
            str.to_s.downcase.gsub(/\s/, '-')
        end

        def create_new_tag(tag, posts)
            site = @site
            layout = 'tag-page'
            tag_name = jekyll_tagging_slug(tag)
            
            posts.sort.reverse!

            # Paginate
            posts.each_slice(5).with_index { |a, i|
                tag_dir = "tags/#{tag_name}/" 
                data = { 'layout' => layout, 'posts' => a, 'tag' => tag }

                page_name = "#{i}#{site.layouts[data['layout']].ext}"

                site.pages << TagPage.new(
                    site, site.source, tag_dir, page_name, data
                )
            }
        end
    end
end